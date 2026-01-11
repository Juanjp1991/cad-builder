"""Section parser for component-based code modification.

This module provides utilities to parse, extract, and replace named sections
in build123d code, enabling targeted modifications without affecting other parts.
"""

import re
from typing import Optional


# Pattern to match section markers: # === SECTION_NAME ===
SECTION_PATTERN = re.compile(r'^(\s*)# === ([A-Z_]+) ===$', re.MULTILINE)


def parse_sections(code: str) -> dict[str, dict]:
    """Parse code into named sections.
    
    Args:
        code: The complete build123d code with section markers.
        
    Returns:
        Dict mapping section names to {start, end, content, indent} info.
        
    Example:
        >>> sections = parse_sections(code)
        >>> sections["HEAD"]
        {"start": 45, "end": 120, "content": "Box(30, 25, 25)", "indent": "    "}
    """
    sections = {}
    matches = list(SECTION_PATTERN.finditer(code))
    
    for i, match in enumerate(matches):
        section_name = match.group(2)
        indent = match.group(1)
        start = match.end() + 1  # Start after the newline
        
        # End is either the next section or end of code
        if i + 1 < len(matches):
            # Find where the next section marker line starts
            end = matches[i + 1].start()
            # Trim trailing whitespace/newlines
            while end > start and code[end - 1] in '\n\r \t':
                end -= 1
        else:
            # Last section - find where code ends (before result = or end of BuildPart)
            # Look for 'result =' or end of code
            result_match = re.search(r'\n\s*result\s*=', code[start:])
            if result_match:
                end = start + result_match.start()
            else:
                end = len(code)
            # Trim trailing whitespace
            while end > start and code[end - 1] in '\n\r \t':
                end -= 1
        
        content = code[start:end].strip()
        
        sections[section_name] = {
            "start": match.start(),
            "end": end,
            "content": content,
            "indent": indent,
            "marker_end": match.end()
        }
    
    return sections


def get_section(code: str, section_name: str) -> Optional[str]:
    """Extract a specific section's code.
    
    Args:
        code: The complete build123d code.
        section_name: The section to extract (e.g., "LEGS", "HEAD").
        
    Returns:
        The section's code content, or None if not found.
    """
    sections = parse_sections(code)
    section = sections.get(section_name.upper())
    return section["content"] if section else None


def replace_section(code: str, section_name: str, new_content: str) -> str:
    """Replace a section's content while preserving everything else.
    
    Args:
        code: The complete build123d code.
        section_name: The section to replace.
        new_content: The new code content for this section.
        
    Returns:
        The complete code with the section replaced.
        
    Raises:
        ValueError: If section not found.
    """
    sections = parse_sections(code)
    section = sections.get(section_name.upper())
    
    if not section:
        raise ValueError(f"Section '{section_name}' not found in code")
    
    # Preserve the section marker and indent
    indent = section["indent"]
    marker_end = section["marker_end"]
    section_end = section["end"]
    
    # Indent the new content to match
    indented_content = "\n".join(
        f"{indent}    {line}" if line.strip() else line
        for line in new_content.strip().split("\n")
    )
    
    # Splice: before marker end + newline + new content + after section end
    new_code = code[:marker_end] + "\n" + indented_content + "\n" + code[section_end:]
    
    return new_code


def list_sections(code: str) -> list[str]:
    """List all section names found in the code.
    
    Args:
        code: The build123d code to analyze.
        
    Returns:
        List of section names (e.g., ["BODY", "HEAD", "LEGS"]).
    """
    sections = parse_sections(code)
    return list(sections.keys())


def identify_target_section(modification_prompt: str, available_sections: list[str]) -> Optional[str]:
    """Identify which section a modification request targets.
    
    Args:
        modification_prompt: The user's modification request.
        available_sections: List of section names in the code.
        
    Returns:
        The target section name, or None if unclear.
    """
    prompt_lower = modification_prompt.lower()
    
    # Map common words to section names
    keyword_map = {
        "head": "HEAD",
        "body": "BODY", "torso": "BODY", "chest": "BODY",
        "leg": "LEGS", "legs": "LEGS", "feet": "LEGS", "foot": "LEGS",
        "arm": "ARMS", "arms": "ARMS", "hand": "ARMS", "hands": "ARMS",
        "tail": "TAIL",
        "antenna": "ANTENNA", "antennae": "ANTENNA",
        "wing": "WINGS", "wings": "WINGS",
        "wheel": "WHEELS", "wheels": "WHEELS", "tire": "WHEELS",
        "eye": "EYES", "eyes": "EYES",
        "ear": "EARS", "ears": "EARS",
        "neck": "NECK",
        "base": "BASE", "bottom": "BASE",
        "top": "TOP", "roof": "TOP",
    }
    
    for keyword, section in keyword_map.items():
        if keyword in prompt_lower and section in available_sections:
            return section
    
    # Try direct section name match
    for section in available_sections:
        if section.lower() in prompt_lower:
            return section
    
    return None
